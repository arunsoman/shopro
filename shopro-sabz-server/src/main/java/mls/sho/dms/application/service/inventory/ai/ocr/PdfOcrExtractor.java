package mls.sho.dms.application.service.inventory.ai.ocr;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * PdfOcrExtractor
 */
@Component
public class PdfOcrExtractor {

    private static final int DPI = 300;
    private static final float DESKEW_THRESHOLD = 0.5f;

    static {
        nu.pattern.OpenCV.loadLocally();
    }

    private final Tesseract tesseract;

    public PdfOcrExtractor() {
        tesseract = new Tesseract();
        String tessdata = System.getenv("TESSDATA_PREFIX");
        if (tessdata != null && !tessdata.isEmpty()) {
            tesseract.setDatapath(tessdata);
        } else {
            // Check common system paths for Linux (Arch, Ubuntu)
            File systemTessData = new File("/usr/share/tessdata");
            if (systemTessData.exists()) {
                tesseract.setDatapath(systemTessData.getAbsolutePath());
            } else {
                tesseract.setDatapath("tessdata");
            }
        }
        tesseract.setLanguage("eng");
        tesseract.setPageSegMode(6);
        tesseract.setOcrEngineMode(3);
        tesseract.setVariable("tessedit_char_whitelist",
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
                "0123456789.,/-:()%₹$& \n\t");
    }

    public String extract(File pdfFile) throws IOException {
        StringBuilder sb = new StringBuilder();

        try (PDDocument doc = PDDocument.load(pdfFile)) {
            PDFRenderer renderer = new PDFRenderer(doc);
            int pageCount = doc.getNumberOfPages();

            for (int page = 0; page < pageCount; page++) {
                BufferedImage rawImage = renderer.renderImageWithDPI(page, DPI, ImageType.RGB);
                BufferedImage cleanImage = preprocess(rawImage);

                try {
                    String pageText = tesseract.doOCR(cleanImage);
                    sb.append("--- PAGE ").append(page + 1).append(" ---\n");
                    sb.append(pageText).append("\n");
                } catch (TesseractException e) {
                    sb.append("--- PAGE ").append(page + 1).append(" (OCR FAILED) ---\n");
                }
            }
        }

        return sb.toString();
    }

    private BufferedImage preprocess(BufferedImage input) throws IOException {
        Mat mat = bufferedImageToMat(input);
        Mat grey = new Mat();
        Imgproc.cvtColor(mat, grey, Imgproc.COLOR_BGR2GRAY);

        Mat binary = new Mat();
        Imgproc.adaptiveThreshold(
                grey, binary,
                255,
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                Imgproc.THRESH_BINARY,
                15,
                10
        );

        Mat denoised = new Mat();
        Imgproc.medianBlur(binary, denoised, 3);
        Mat deskewed = deskew(denoised);

        return matToBufferedImage(deskewed);
    }

    private Mat deskew(Mat binary) {
        Mat lines = new Mat();
        Imgproc.HoughLinesP(binary, lines, 1, Math.PI / 180, 100, 100, 10);

        if (lines.rows() == 0) return binary;

        List<Double> angles = new ArrayList<>();
        for (int i = 0; i < lines.rows(); i++) {
            double[] line = lines.get(i, 0);
            double angle = Math.toDegrees(Math.atan2(line[3] - line[1], line[2] - line[0]));
            if (Math.abs(angle) < 45) {
                angles.add(angle);
            }
        }

        if (angles.isEmpty()) return binary;

        angles.sort(Double::compareTo);
        double medianAngle = angles.get(angles.size() / 2);

        if (Math.abs(medianAngle) < DESKEW_THRESHOLD) return binary;

        Point centre = new Point(binary.cols() / 2.0, binary.rows() / 2.0);
        Mat rotM = Imgproc.getRotationMatrix2D(centre, medianAngle, 1.0);
        Mat result = new Mat();
        Imgproc.warpAffine(binary, result, rotM,
                binary.size(), Imgproc.INTER_LINEAR,
                Core.BORDER_CONSTANT, new Scalar(255));
        return result;
    }

    private Mat bufferedImageToMat(BufferedImage img) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        byte[] bytes = baos.toByteArray();
        return Imgcodecs.imdecode(new MatOfByte(bytes), Imgcodecs.IMREAD_COLOR);
    }

    private BufferedImage matToBufferedImage(Mat mat) throws IOException {
        MatOfByte mob = new MatOfByte();
        Imgcodecs.imencode(".png", mat, mob);
        byte[] bytes = mob.toArray();
        java.io.InputStream is = new java.io.ByteArrayInputStream(bytes);
        return ImageIO.read(is);
    }
}
