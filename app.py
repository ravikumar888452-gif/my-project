from flask import Flask, render_template, Response
import cv2
import time

app = Flask(__name__)

cap = cv2.VideoCapture(0)
time.sleep(2)

if not cap.isOpened():
    print("Camera not working")
    exit()

line_y = 200
count = 0

def generate_frames():
    global count

    while True:
        success, frame1 = cap.read()
        success, frame2 = cap.read()

        if not success:
            break

        diff = cv2.absdiff(frame1, frame2)
        gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 25, 255, cv2.THRESH_BINARY)
        dilated = cv2.dilate(thresh, None, iterations=2)

        contours, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        for contour in contours:
            if cv2.contourArea(contour) < 2000:
                continue

            x, y, w, h = cv2.boundingRect(contour)
            center_y = y + h // 2

            cv2.rectangle(frame1, (x, y), (x+w, y+h), (0, 255, 0), 2)

            # Detect crossing
            if abs(center_y - line_y) < 5:
                count += 1
                cv2.putText(frame1, "TRIGGERED!", (10, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

        # Draw line
        cv2.line(frame1, (0, line_y), (640, line_y), (255, 0, 0), 2)

        # Show count
        cv2.putText(frame1, f"COUNT: {count}", (10, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)

        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame1)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video')
def video():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True, threaded=True)