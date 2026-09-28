declare module "html2canvas" {
  export interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string | null;
    logging?: boolean;
    allowTaint?: boolean;
    width?: number;
    height?: number;
    [key: string]: any;
  }
  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}

declare module "next/navigation" {
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function usePathname(): string;
}
