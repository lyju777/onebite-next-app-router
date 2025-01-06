"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error.message);
  }, [error]);
  return (
    <div>
      <h3>오류가 발생했습니다.</h3>
      <button onClick={() => reset()}>다시 시도</button>
    </div>
  );
}
