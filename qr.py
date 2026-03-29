import qrcode

url="https://github.com/Purabk171/tech-flow-automation.git"


qr = qrcode.make(url)


qr.save("qr.png")
print("qr done")