import json

# The JSON data rescued from the old project
products_json = """
[PASTE_JSON_HERE]
"""

products = json.loads(products_json)

sql_lines = []
for p in products:
    # Escape single quotes in strings
    name = p['name'].replace("'", "''")
    desc = p['description'].replace("'", "''") if p['description'] else ""
    cat = p['category'].replace("'", "''")
    
    # Handle JSONB fields (images, colors)
    images_json = json.dumps(p['images'])
    colors_json = json.dumps(p['colors'])
    
    # Handle NULLs for original_price/discount
    orig_price = p['original_price'] if p['original_price'] is not None else 'NULL'
    discount = p['discount_percentage'] if p['discount_percentage'] is not None else 'NULL'
    
    line = f"INSERT INTO products (id, name, description, price, category, image, stock, images, colors, original_price, discount_percentage) VALUES ('{p['id']}', '{name}', '{desc}', {p['price']}, '{cat}', '{p['image']}', {p['stock']}, '{images_json}'::jsonb, '{colors_json}'::jsonb, {orig_price}, {discount});"
    sql_lines.append(line)

print("\\n".join(sql_lines))
