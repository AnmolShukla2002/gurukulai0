// src/app/student/my-library/[id]/page.tsx
import ChapterViewer from './client';

export default function ChapterViewPage({ params }: { params: { id: string } }) {
  return <ChapterViewer chapterId={params.id} />;
}
