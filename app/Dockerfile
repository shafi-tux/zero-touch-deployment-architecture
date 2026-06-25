#defining the base image
FROM python:3.12-alpine

#set the working directory
WORKDIR /app

#copy the contents over
COPY server.py index.html script.js style.css requirements.txt /app/

#run the pip install command:
RUN pip install --no-cache-dir -r requirements.txt

#expose this port (documentation)
EXPOSE 8000

#the command to run
CMD ["python", "-u", "server.py"]
