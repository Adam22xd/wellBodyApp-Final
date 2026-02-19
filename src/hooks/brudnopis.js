const promise = new Promise((resolve, reject) => {
    // ⏳ tu zaczyna się robienie kawy (pending)

    setTimeout(() => {
        const milkAvailable = true;

        if (milkAvailable) {
            resolve("Gotowe! ☕"); // ✅ sukces – kawa jest
        } else {
            reject("Brak mleka 😢"); // ❌ porażka – brak mleka
        }
    }, 2000);
});

async function run() {
    try {
        const result = await promise; // ⏳ czekamy na kawę
        console.log(result);          // ✅ pijemy kawę
    } catch (error) {
        console.log(error);           // ❌ info: brak mleka
    }
}

run();



const promise2 = new Promise((resolve,reject) => {

    setTimeout(() => {

        const wirklich = true;
        
        if(wirklich) {
            resolve("o znowu jedzonko ");
        
        }else (
            reject("kurde ale skąpieć !")
    )
    
}, 10000);


async function render() {
    try{
        const 
    }
}


})