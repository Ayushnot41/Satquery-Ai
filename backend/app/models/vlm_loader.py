import time
import os
import torch
import numpy as np
from PIL import Image

from .base import VLMBackend, VLMResponse

class LocalVLMBackend(VLMBackend):
    def __init__(self, model_name: str = "HuggingFaceTB/SmolVLM-500M-Instruct", lora_path: str = "./backend/checkpoints/vqa_lora_experiment_01"):
        self._model_name = model_name
        self._lora_path = lora_path
        self._model = None
        self._processor = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load_model(self):
        if self._model is not None:
            return
        
        try:
            from transformers import AutoProcessor, AutoModelForVision2Seq
            from peft import PeftModel
        except ImportError:
            raise ImportError("Please install 'transformers' and 'peft' to use the local VLM backend.")

        # Load base model
        base_model = AutoModelForVision2Seq.from_pretrained(
            self._model_name,
            torch_dtype=torch.float16 if self._device == "cuda" else torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        )

        # Load LoRA adapter if path exists
        if os.path.exists(self._lora_path):
            self._model = PeftModel.from_pretrained(base_model, self._lora_path)
        else:
            self._model = base_model

        self._model.to(self._device)
        self._model.eval()

        self._processor = AutoProcessor.from_pretrained(self._model_name)

    async def answer_question(self, image: np.ndarray, question: str, context: str = "") -> VLMResponse:
        self._load_model()
        t0 = time.time()
        
        # Format conversation
        messages = [
            {"role": "user", "content": [
                {"type": "image"}, 
                {"type": "text", "text": f"{context}\n\nQuestion: {question}"}
            ]}
        ]
        
        pil_image = Image.fromarray(image.astype("uint8"))
        
        # Prepare inputs
        prompt = self._processor.apply_chat_template(messages, add_generation_prompt=True)
        inputs = self._processor(text=prompt, images=[pil_image], return_tensors="pt")
        inputs = {k: v.to(self._device) for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = self._model.generate(**inputs, max_new_tokens=150, temperature=0.1)
        
        # Decode
        generated_texts = self._processor.batch_decode(outputs, skip_special_tokens=True)
        # Extract the assistant's response (depends on tokenizer template output)
        ans = generated_texts[0]
        if "Assistant:" in ans:
            ans = ans.split("Assistant:")[-1].strip()
        elif "<|im_start|>assistant" in ans:
            ans = ans.split("<|im_start|>assistant")[-1].replace("<|im_end|>", "").strip()
        
        t1 = time.time()
        latency_ms = (t1 - t0) * 1000.0
        
        return VLMResponse(
            answer=ans,
            raw_output=generated_texts[0],
            model_name=f"{self._model_name} (LoRA)",
            model_version="1.0-lora",
            tokens_used=len(outputs[0]),
            latency_ms=latency_ms
        )

    async def generate_caption(self, image: np.ndarray, style: str = "detailed") -> VLMResponse:
        return await self.answer_question(image, f"Provide a {style} caption for this satellite imagery.", "")

    async def analyze_change(self, image_before: np.ndarray, image_after: np.ndarray, question: str = "What changed between these two images?") -> VLMResponse:
        return await self.answer_question(image_after, question, "Analyze post-event imagery for changes.")

    async def health_check(self) -> dict:
        return {"status": "ok", "backend": self.backend_name, "lora_path": self._lora_path}

    @property
    def backend_name(self) -> str:
        return "local_vlm_peft"
