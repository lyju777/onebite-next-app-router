import { BookData, ReviewData } from "@/types";
import style from "./page.module.css";
import { notFound } from "next/navigation";
import ReviewItem from "@/components/review-item";
import ReviewEditor from "@/components/review-editor";
import Image from "next/image";
import { Metadata } from "next";

// export const dynamicParams = false;

export async function generateStaticParams() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const books: BookData[] = await response.json();
  return books.map((book) => ({ id: book.id.toString() }));
}

async function BookDetail({ bookId }: { bookId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    return <div>오류가 발생했습니다...</div>;
  }
  const book: BookData = await response.json();

  const { title, subTitle, description, author, publisher, coverImgUrl } = book;

  return (
    <section>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${coverImgUrl}')` }}
      >
        <Image
          src={coverImgUrl}
          width={240}
          height={300}
          alt={`도서${title}의 책 표지`}
        />
      </div>
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      <div className={style.author}>
        {author} | {publisher}
      </div>
      <div className={style.description}>{description}</div>
    </section>
  );
}

async function ReviewList({ bookId }: { bookId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review/book/${bookId}`,
      {
        next: {
          tags: [`review-${bookId}`],
          revalidate: 3600, // 1시간마다 재검증
        },
        cache: "force-cache", // 캐시 강제 사용
      }
    );

    if (!response.ok) {
      // 404 등의 경우 빈 배열 반환
      if (response.status === 404) {
        return <section>리뷰가 없습니다.</section>;
      }
      return <section>리뷰를 불러올 수 없습니다.</section>;
    }

    const reviews: ReviewData[] = await response.json();

    // 리뷰가 없는 경우 처리
    if (reviews.length === 0) {
      return <section>아직 작성된 리뷰가 없습니다.</section>;
    }

    return (
      <section>
        {reviews.map((review) => (
          <ReviewItem key={review.id} {...review} />
        ))}
      </section>
    );
  } catch (error) {
    console.error("리뷰 로딩 중 오류:", error);
    return <section>리뷰를 불러오는 중 오류가 발생했습니다.</section>;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${id}: 도서 상세`,
    description: `${id}에 대한 도서 상세 페이지입니다.`,
    openGraph: {
      title: `${id}: 도서 상세`,
      description: `${id}에 대한 도서 상세 페이지입니다.`,
      images: ["/thumbnail.png"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 비동기로 변환
  return (
    <div className={style.container}>
      <BookDetail bookId={id} />
      <ReviewEditor bookId={id} />
      <ReviewList bookId={id} />
    </div>
  );
}
