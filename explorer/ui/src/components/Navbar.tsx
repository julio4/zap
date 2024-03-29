import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="flex justify-between p-4">
      <Link href="/app/submit" passHref>
        Submit
      </Link>
      <Link href="/app/sources" passHref>
        Sources
      </Link>
    </nav>
  );
};

export default Navbar;