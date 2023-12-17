import axios from "axios";
const API = "https://fakerapi.it/api/v1/"

// This is an example service that returns random data
class RandomService {
  // This is an example function that returns a random number
  // The `id` parameter is not used in this example, but it's here to show how to pass parameters
  static async getNb(id: number): Promise<number> {
    const endpoint = "custom?_quantity=1&result=number";
    const res = await axios.get(API + endpoint);
    const number = res.data.data[0].result;

    if (number === undefined) {
      throw new Error("NaN returned");
    }

    return number
  }
}

export default RandomService;