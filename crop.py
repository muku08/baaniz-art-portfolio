import sys
from PIL import Image

def crop_center(image_path, output_path, zoom_factor=0.5):
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # Calculate new dimensions
        new_width = width * zoom_factor
        new_height = height * zoom_factor
        
        # Calculate coordinates for center crop
        left = (width - new_width) / 2
        top = (height - new_height) / 2
        right = (width + new_width) / 2
        bottom = (height + new_height) / 2
        
        # Crop and save
        img_cropped = img.crop((left, top, right, bottom))
        img_cropped.save(output_path)
        print(f"Successfully cropped and saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    crop_center("logo.png.png", "images/logo.png", zoom_factor=0.5)
