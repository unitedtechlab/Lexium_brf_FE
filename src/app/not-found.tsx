import Link from "next/link";
import Image from "next/image";
import notFound from '@/app/assets/images/404.png'

export default function NotFound() {
  return (
    <div className="error_page">
      <div className="error_page_wrapper">
        <h1>404</h1>
        <h4>Page not found 🥲</h4>
        <div className="error_image">
          <Image src={notFound} alt="Not Found image" width={200} />
        </div>
        <p>Wea can't seem to find a page you are looking for</p>
        <Link href="/" className="btn">Go Back</Link>
      </div>
    </div>
  );
}
