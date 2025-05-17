import os

files = [f for f in os.listdir('.') if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]

print('<div class="gallery">')
for file in files:
    print(f'  <img src="{file}" alt="">')
print('</div>')
