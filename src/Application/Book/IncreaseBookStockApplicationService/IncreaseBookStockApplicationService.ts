import { ITransactionManager } from "Application/shared/ITransactionManager";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { IBookRepository } from "Domain/models/Book/IBookRepository";

export type IncreaseBookStockCommand = {
  bookId: string;
  incrementAmount: number;
};

export class IncreaseBookStockApplicationService {
  constructor(
    private bookRepository: IBookRepository,
    private transactionManage: ITransactionManager
  ) {}

  async execute(command: IncreaseBookStockCommand): Promise<void> {
    await this.transactionManage.begin(async () => {
      const book = await this.bookRepository.find(new BookId(command.bookId));

      if (!book) {
        throw new Error("書籍が存在しません");
      }

      // Bookエンティティのメソッドを呼び出し在庫を増やす
      // ビジネスロジックをアプリケーションサービス側に持たせない
      // ドメインオブジェクトを利用してユースケースを安全に実現する
      book.increaseStock(command.incrementAmount);

      await this, this.bookRepository.update(book);
    });
  }
}
