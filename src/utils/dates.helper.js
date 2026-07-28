export const dateNotHours = (date) => {
    return new Date(date).toISOString().split("T")[0];
}

export const getTodaySTR = ()=>{
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return todayString
}