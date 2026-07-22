export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-shade-50 mb-8">Have a question? We&apos;d love to hear from you.</p>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Email</h3>
          <p className="text-sm text-shade-50">hello@inspiredbynature.com</p>
        </div>
        <div>
          <h3 className="font-semibold">Phone</h3>
          <p className="text-sm text-shade-50">+92 300 1234567</p>
        </div>
        <div>
          <h3 className="font-semibold">Address</h3>
          <p className="text-sm text-shade-50">Lahore, Pakistan</p>
        </div>
      </div>
    </div>
  );
}
