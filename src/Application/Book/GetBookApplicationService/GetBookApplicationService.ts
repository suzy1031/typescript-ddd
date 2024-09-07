import { BookId } from "Domain/models/Book/BookId/BookId";
import { IBookRepository } from "Domain/models/Book/IBookRepository";
import { BookDTO } from "../BookDTO";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetBookApplicationService {
  constructor(
    @inject("IBookRepository")
    private bookRepository: IBookRepository
  ) {}

  async execute(isbn: string): Promise<BookDTO | null> {
    // isbnを直接findメソッドに渡さない. BookIdインスタンスを生成して渡す
    const book = await this.bookRepository.find(new BookId(isbn));

    return book ? new BookDTO(book) : null;
  }
}
