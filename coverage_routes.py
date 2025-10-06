from flask import Blueprint, jsonify

coverage_bp = Blueprint('coverage_bp', __name__)

@coverage_bp.route('/coverages')
def get_coverages():
    from pathlib import Path
    import json

    coverage_path = Path("static/data/coverages.json")
    data = json.loads(coverage_path.read_text(encoding="utf-8"))
    return jsonify(data)