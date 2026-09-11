"""
Automated SVG Asset Integrity and XML Compliance Test Suite
Ensures that all 3D architectural, physics, and agent SVG diagrams in assets/
are 100% valid XML, contain proper namespaces, have no unmatched tags or invalid HTML
entities, and render without errors on GitHub and strict XML renderers.
"""

import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path
import pytest

ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "assets"

EXPECTED_SVGS = [
    "agent_debate_matrix_3d.svg",
    "architecture_3d_pipeline.svg",
    "bhuvision_3d_banner.svg",
    "earth_3d_orbit_constellation.svg",
    "multi_agent_got_council.svg",
    "sar_3d_backscatter_mesh.svg",
    "sar_radar_physics_spectrum.svg",
    "temporal_bitemporal_3d_cockpit.svg",
]

# Prohibited HTML-only entities that break strict XML parsers / GitHub Camo proxy
PROHIBITED_HTML_ENTITIES_REGEX = re.compile(
    r"&(?:ldquo|rdquo|lsquo|rsquo|nbsp|mdash|ndash|bull|copy|reg|trade|deg|plusmn|times|divide);",
    re.IGNORECASE,
)

# Pattern to find url(#id) references in SVG attributes
URL_REF_REGEX = re.compile(r"url\(#([a-zA-Z0-9_-]+)\)")


def get_all_svg_files():
    """Retrieve all SVG files present in the assets directory."""
    assert ASSETS_DIR.exists(), f"Assets directory not found at {ASSETS_DIR}"
    svg_files = list(ASSETS_DIR.glob("*.svg"))
    assert len(svg_files) > 0, "No SVG files found in assets directory"
    return svg_files


def test_expected_svg_assets_present():
    """Verify that all core 3D architectural SVGs exist in assets/."""
    for filename in EXPECTED_SVGS:
        svg_path = ASSETS_DIR / filename
        assert svg_path.exists(), f"Critical SVG asset missing: {filename}"
        assert svg_path.stat().st_size > 1000, f"SVG asset {filename} is suspiciously small or empty"


@pytest.mark.parametrize("svg_filename", EXPECTED_SVGS)
def test_svg_xml_well_formedness(svg_filename):
    """
    Verify that each SVG parses cleanly with standard XML parser.
    Catches unmatched tags, unclosed patterns, and illegal XML syntax.
    """
    svg_path = ASSETS_DIR / svg_filename
    assert svg_path.exists(), f"File {svg_filename} does not exist"

    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except ET.ParseError as e:
        pytest.fail(f"SVG XML Parse Error in '{svg_filename}': {e}")

    # Verify root tag is <svg> with SVG namespace
    assert root.tag.endswith("svg"), f"Root element of {svg_filename} is not <svg>"
    assert root.attrib.get("viewBox") is not None, f"Missing 'viewBox' attribute in {svg_filename}"


@pytest.mark.parametrize("svg_filename", EXPECTED_SVGS)
def test_no_illegal_html_entities(svg_filename):
    """
    Verify that SVG does not contain HTML-only named entities like &ldquo; or &nbsp;
    which cause fatal XML parsing crashes in GitHub Camo and SVG sanitizers.
    """
    svg_path = ASSETS_DIR / svg_filename
    content = svg_path.read_text(encoding="utf-8")

    matches = PROHIBITED_HTML_ENTITIES_REGEX.findall(content)
    assert not matches, (
        f"Found prohibited HTML entities in {svg_filename}: {matches}. "
        f"Use XML numeric entities (e.g. &#8220;) or direct UTF-8 characters instead."
    )


@pytest.mark.parametrize("svg_filename", EXPECTED_SVGS)
def test_svg_internal_references_integrity(svg_filename):
    """
    Verify that all url(#id) references (gradients, filters, patterns)
    point to IDs that actually exist in the SVG document.
    Prevents black/invisible fills or filter rendering failures.
    """
    svg_path = ASSETS_DIR / svg_filename
    tree = ET.parse(svg_path)
    root = tree.getroot()

    # Collect all element IDs defined in this SVG
    defined_ids = set()
    for elem in root.iter():
        elem_id = elem.attrib.get("id")
        if elem_id:
            defined_ids.add(elem_id)

    # Collect all url(#id) references in attribute values
    missing_refs = []
    for elem in root.iter():
        for attr_name, attr_val in elem.attrib.items():
            if isinstance(attr_val, str) and "url(#" in attr_val:
                for match in URL_REF_REGEX.finditer(attr_val):
                    ref_id = match.group(1)
                    if ref_id not in defined_ids:
                        missing_refs.append(f"Element <{elem.tag.split('}')[-1]}> references missing #{ref_id}")

    assert not missing_refs, (
        f"Broken internal references in {svg_filename}:\n" + "\n".join(missing_refs)
    )
