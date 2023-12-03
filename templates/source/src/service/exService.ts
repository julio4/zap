export class ExService {
  static async getEx(id: string) {
    // Fetch user data from the database
    return { id: id, name: 'Something' };
  }
}
