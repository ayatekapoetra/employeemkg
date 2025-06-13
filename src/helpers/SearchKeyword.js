const SearchDataWithKeyword = (data, keys, keyword) => {
    const searchRegex = new RegExp(keyword, "i"); // RegExp dengan case-insensitive
    return data.filter(item => 
        keys.some(key => searchRegex.test(item[key]?.toString() || ""))
    );
}

export default SearchDataWithKeyword