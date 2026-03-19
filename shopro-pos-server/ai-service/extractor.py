import os
# Force CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from glmocr import GlmOcr
import json

# Initialize with the local config for Ollama
config_path = os.path.join(os.path.dirname(__file__), "config.yaml")

def analyze_document(pdf_path: str):
    try:
        print(f"Analyzing: {pdf_path}")
        # Use GLM-OCR via Ollama
        with GlmOcr(config_path=config_path) as parser:
            # We call the model.
            result = parser.parse(pdf_path)
            
            # Debug print
            print(f"Result type: {type(result)}")
            
            # Get the full dictionary from results
            res_dict = result.to_dict()
            
            # Ensure we have what we want
            markdown_text = res_dict.get("markdown_result", "")
            json_data = res_dict.get("json_result", [])
            
            print(f"Markdown length: {len(markdown_text)}")
            print(f"JSON data type: {type(json_data)}")
            
            return {
                "full_text": markdown_text,
                "structured": json_data
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"GLM-OCR Error: {e}")
        return {
            "full_text": f"Error during GLM-OCR extraction: {str(e)}",
            "structured": []
        }

if __name__ == "__main__":
    pass
