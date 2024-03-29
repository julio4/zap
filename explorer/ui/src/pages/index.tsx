import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Mina zkApp Explorer</h1>
            <div className="flex flex-col items-center justify-center space-y-4">
                <Link href="/submit" className="text-xl text-blue-600 hover:text-blue-800" passHref>
                    Submit a New Source
                </Link>
                <Link href="/sources" className="text-xl text-blue-600 hover:text-blue-800" passHref>
                    View Sources
                </Link>
            </div>
        </div>
    );
}