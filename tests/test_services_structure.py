import ast
from pathlib import Path
import unittest


class ServicesStructureTests(unittest.TestCase):
    def test_actividades_services_has_single_definitions(self):
        services_path = Path(__file__).resolve().parents[1] / "app" / "actividades" / "services.py"
        source = services_path.read_text(encoding="utf-8")
        tree = ast.parse(source)

        names = [node.name for node in tree.body if isinstance(node, ast.FunctionDef)]
        self.assertEqual(names.count("get_actividades"), 1)
        self.assertEqual(names.count("crear_actividad"), 1)


if __name__ == "__main__":
    unittest.main()
