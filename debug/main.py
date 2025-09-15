# 1. 基础for循环（使用range）
print("基础for循环:")
for i in range(5):
    print(f"i = {i}")

# 2. 使用range指定起始和结束值
print("\n带起始和结束值的range:")
for j in range(2, 5):
    print(f"j = {j}")

# 3. 使用range指定步长
print("\n带步长的range:")
for k in range(0, 10, 2):
    print(f"k = {k}")

# 4. 遍历列表
print("\n遍历列表:")
fruits = ["苹果", "香蕉", "橙子"]
for index, fruit in enumerate(fruits):
    print(f"索引: {index}, 值: {fruit}")

# 5. 遍历字典
print("\n遍历字典:")
country_capitals = {
    "中国": "北京",
    "日本": "东京",
    "法国": "巴黎"
}
# 遍历键值对
for country, capital in country_capitals.items():
    print(f"国家: {country}, 首都: {capital}")

# 6. 遍历字符串
print("\n遍历字符串:")
text = "你好, 世界"
for index, char in enumerate(text):
    print(f"位置: {index}, 字符: {char}")

# 7. 使用while循环（类似Go的条件循环）
print("\nwhile循环:")
n = 0
while n < 3:
    print(f"n = {n}")
    n += 1

# 8. 无限循环（需配合break）
print("\n无限循环示例:")
m = 0
while True:
    print(f"m = {m}")
    m += 1
    if m >= 2:
        break

# 9. 使用continue跳过迭代
print("\n使用continue示例:")
for num in range(1, 6):
    if num % 2 == 0:
        continue  # 跳过偶数
    print(f"奇数: {num}")

# 10. 列表推导式（Python特有的循环构造方式）
print("\n列表推导式示例:")
squares = [x**2 for x in range(1, 6)]
print(f"平方数列表: {squares}")

# 11. 嵌套循环
print("\n嵌套循环示例:")
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} * {j} = {i*j}")
    print("---")

# 12. 遍历集合
print("\n遍历集合:")
unique_numbers = {1, 3, 5, 3, 2, 1}  # 集合会自动去重
for num in unique_numbers:
    print(f"唯一数字: {num}")

# 13. 使用else子句（循环正常结束时执行）
print("\n带else的循环示例:")
for x in range(3):
    print(f"x = {x}")
else:
    print("循环正常结束")

# 14. 使用zip同时遍历多个序列
print("\n使用zip遍历多个序列:")
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
for name, age in zip(names, ages):
    print(f"{name} 的年龄是 {age} 岁")
