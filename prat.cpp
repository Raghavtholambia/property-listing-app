#include <iostream>
using namespace std;

int main() {
    char ch = 'a';
    cout << ++ch;
    return 0;
}

// #include <bits/stdc++.h>
// using namespace std;

// // Custom comparator
// bool compare(string a, string b) {
//     return a + b > b + a;
// }

// int main() {
//     vector<int> nums = {9099, 9, 999, 899, 9};

//     // Convert integers to strings
//     vector<string> arr;
//     for (int x : nums) {
//         arr.push_back(to_string(x));
//     }

//     // Sort using custom comparator
//     sort(arr.begin(), arr.end(), compare);

//     // Edge case: if largest is "0"
//     if (arr[0] == "0") {
//         cout << "0";
//         return 0;
//     }

//     // Concatenate result
//     string result = "";
//     for (string s : arr) {
//         result += s;
//     }

//     cout << result;
//     return 0;
// }
