import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold font-heading mb-2">404 - Page Not Found</h2>
      <p className="text-neutral-400 mb-6">The page or resource you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
      >
        Return to Opportunity Radar
      </Link>
    </div>
  );
}
