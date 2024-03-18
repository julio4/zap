import Head from "next/head";

type HeaderProps = {
  title: string;
  description: string;
};

const Header = ({ title, description }: HeaderProps): JSX.Element => (
    <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/assets/favicon.ico" />
  </Head>
);

export default Header;
