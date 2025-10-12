import QuestionPaperClientPage from './client';

export default function QuestionPaperPage({ params }: { params: { id: string } }) {
  return <QuestionPaperClientPage paperId={params.id} />;
}
