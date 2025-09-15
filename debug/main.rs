fn main() {
    // 最基本的 1 到 5 循环
    for i in 1..=5 {
        println!("i = {}", i);
    }

    println!("---");

    // 1 到 4 (不包含5)
    for i in 1..5 {
        println!("i = {}", i);
    }
}
