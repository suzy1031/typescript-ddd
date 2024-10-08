import { ITransactionManager } from "Application/shared/ITransactionManager";
import { Book } from "Domain/models/Book/Book";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { IBookRepository } from "Domain/models/Book/IBookRepository";
import { Price } from "Domain/models/Book/Price/Price";
import { Title } from "Domain/models/Book/Title/Title";
import { ISBNDuplicationCheckDomainService } from "Domain/services/Book/ISBNDuplicationCheckDomainService/ISBNDuplicationCheckDomainService";
import { inject, injectable } from "tsyringe";

export type RegisterBookCommand = {
  isbn: string;
  title: string;
  priceAmount: number;
};
// ドメイン知識を持たない層
// ドメインオブジェクトを利用するだけでユースケースを実現する
@injectable()
export class RegisterBookApplicationService {
  constructor(
    @inject("IBookRepository")
    private bookRepository: IBookRepository,
    @inject("ITransactionManager")
    private transactionManager: ITransactionManager
  ) {}

  async execute(command: RegisterBookCommand): Promise<void> {
    await this.transactionManager.begin(async () => {
      const isDuplicateISBN = await new ISBNDuplicationCheckDomainService(
        this.bookRepository
      ).execute(new BookId(command.isbn));

      if (isDuplicateISBN) {
        throw new Error("既に存在する書籍です");
      }

      // 引数は直接渡さない
      // バリューオブジェクト（インスタンス）を生成して渡す
      const book = Book.create(
        new BookId(command.isbn),
        new Title(command.title),
        new Price({ amount: command.priceAmount, currency: "JPY" })
      );

      // インターフェイス（抽象）を利用してsaveメソッドを実行
      // 実態はprisma.book.createを操作してdbに保存する
      await this.bookRepository.save(book);
    });
  }
}
