import { redirect } from 'next/navigation';

export default function PatientsPage() {
  // Redirect to patient list by default
  redirect('/patients/list');
}