import restaurant from "../assets/restaurant1.png";

const Contact = () => {
  return (
    <div className="max-w-[1400px] mx-auto mt-16 p-4">

        <div className="shadow-lg rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="max-auto">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

                    <p className="text-lg mb-2">
                        <span className="font-semibold">Email: </span>
                        prashantkaemail.com
                    </p>

                    <p className="text-lg mb-2">
                        <span className="font-semibold">Phone: </span>
                        +91 1234567890
                    </p>

                    <p className="text-lg mb-2">
                        <span className="font-semibold">Name: </span>
                        chai ka dhandha
                    </p>
                </div>

                <div className="mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Address</h2>
                    <p className="text-lg mb-2">221 B</p>
                    <p className="text-lg mb-2">Baker street</p>
                    <p className="text-lg">Mor english</p>
                </div>
            </div>

            

        </div>
    </div>
  )
}

export default Contact