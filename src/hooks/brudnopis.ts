// Scratch file kept as valid TypeScript so it does not break tooling.
const promise = new Promise<string>((resolve, reject) => {
  setTimeout(() => {
    const milkAvailable = true;

    if (milkAvailable) {
      resolve("Gotowe!");
      return;
    }

    reject(new Error("Brak mleka"));
  }, 2000);
});

async function run() {
  try {
    const result = await promise;
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

run();
