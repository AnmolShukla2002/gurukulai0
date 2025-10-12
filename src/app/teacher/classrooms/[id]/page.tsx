import ClassroomDetailsClientPage from './client';

export default function ClassroomDetailsPage({ params }: { params: { id: string } }) {
  return <ClassroomDetailsClientPage classroomId={params.id} />;
}
