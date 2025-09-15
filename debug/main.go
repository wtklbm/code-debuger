package main

import "fmt"

func main() {
	// 1. 基础for循环（类似C语言的三段式）
	fmt.Println("基础for循环:")
	for i := 0; i < 5; i++ {
		fmt.Printf("i = %d\n", i)
	}

	// 2. 只有条件的for循环（类似while循环）
	fmt.Println("\n只有条件的for循环:")
	j := 0
	for j < 3 {
		fmt.Printf("j = %d\n", j)
		j++
	}

	// 3. 无限循环（需配合break使用）
	fmt.Println("\n无限循环示例:")
	k := 0
	for {
		fmt.Printf("k = %d\n", k)
		k++
		if k >= 2 {
			break
		}
	}

	// 4. for-range循环（遍历集合）
	fmt.Println("\nfor-range遍历切片:")
	fruits := []string{"苹果", "香蕉", "橙子"}
	for index, value := range fruits {
		fmt.Printf("索引: %d, 值: %s\n", index, value)
	}

	// 5. 遍历map
	fmt.Println("\nfor-range遍历map:")
	countryCapitals := map[string]string{
		"中国": "北京",
		"日本": "东京",
		"法国": "巴黎",
	}
	for country, capital := range countryCapitals {
		fmt.Printf("国家: %s, 首都: %s\n", country, capital)
	}

	// 6. 遍历字符串（处理Unicode字符）
	fmt.Println("\nfor-range遍历字符串:")
	str := "你好, 世界"
	for pos, char := range str {
		fmt.Printf("位置: %d, 字符: %c (Unicode: U+%04X)\n", pos, char, char)
	}

	// 7. 使用continue跳过迭代
	fmt.Println("\n使用continue示例:")
	for num := 1; num <= 5; num++ {
		if num%2 == 0 {
			continue // 跳过偶数
		}
		fmt.Printf("奇数: %d\n", num)
	}
}
