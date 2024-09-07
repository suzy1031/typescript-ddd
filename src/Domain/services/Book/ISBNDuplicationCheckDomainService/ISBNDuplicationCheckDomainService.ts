import { BookId } from "Domain/models/Book/BookId/BookId";
import { IBookRepository } from "Domain/models/Book/IBookRepository";

export class ISBNDuplicationCheckDomainService {
  constructor(private bookRepository: IBookRepository) {}

  async execute(isbn: BookId): Promise<boolean> {
    const isDuplicateISBNBook = await this.bookRepository.find(isbn);
    const isDuplicateISBN = !!isDuplicateISBNBook;

    return isDuplicateISBN;
  }
}
