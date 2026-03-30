# Convert any encoding to UTF-8
with open("requirements.txt", "rb") as f:
    content = f.read()

# Try UTF-16 decode first, fallback to UTF-8 ignoring errors
try:
    decoded = content.decode("utf-16")
except UnicodeError:
    decoded = content.decode("utf-8", errors="ignore")

with open("requirements.txt", "w", encoding="utf-8") as f:
    f.write(decoded)