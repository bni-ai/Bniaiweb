"use client";

import { useRef } from "react";

import { Button } from "../../../../components/ui/button";
import { deletePresentationAction } from "../../../../lib/actions/presentations";

export function DeletePresentationButton({ id }: { id: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={deletePresentationAction}
      onSubmit={(e) => {
        if (!confirm("確定要刪除這份簡報嗎？此動作將無法復原！")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" className="rounded-full px-4">刪除</Button>
    </form>
  );
}
