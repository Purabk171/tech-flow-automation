import qrcode

url="https://purabk171.github.io/tech-flow-automation/"


qr = qrcode.make(url)


qr.save("tech-flow-automation.png")
print("qr done")