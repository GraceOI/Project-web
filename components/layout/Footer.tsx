export default function Footer() {
    return (
      <footer className="bg-amber-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thai Desserts Online</h3>
              <p className="text-amber-200">
                An online shop that offers a variety of handcrafted Thai desserts 
                delivered directly from producers to your doorstep.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
              <p className="mb-2">Email: contact@thaidessert.com</p>
              <p>Phone: 02-123-4567</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
              <div className="flex space-x-3">
                <div className="bg-white text-amber-800 p-1 rounded">
                  Bank Transfer
                </div>
                <div className="bg-white text-amber-800 p-1 rounded">
                  PromptPay
                </div>
                <div className="bg-white text-amber-800 p-1 rounded">
                  Credit Card
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-amber-600 mt-6 pt-6 text-center text-amber-200">
            <p>© {new Date().getFullYear()} Thai Desserts Online. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }