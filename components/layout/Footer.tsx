export default function Footer() {
    return (
      <footer className="bg-amber-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="border-t border-amber-600 mt-6 pt-6 text-center text-amber-200">
            <p>© {new Date().getFullYear()} Thai Desserts Online. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }