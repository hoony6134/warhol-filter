import CoreImage
import AppKit
let url = CommandLine.arguments[1], out = CommandLine.arguments[2]
let f = CIFilter(name: "CIQRCodeGenerator")!
f.setValue(url.data(using: .utf8), forKey: "inputMessage")
f.setValue("M", forKey: "inputCorrectionLevel")
// CoreImage emits 1px per module with a 1-module margin; scale with nearest-neighbour so edges stay sharp.
let img = f.outputImage!.transformed(by: CGAffineTransform(scaleX: 40, y: 40))
let rep = NSBitmapImageRep(ciImage: img)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
print(Int(img.extent.width), "px")
