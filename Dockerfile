FROM public.ecr.aws/lambda/nodejs:20

# Install required dependencies
RUN dnf install -y \
    atk \
    cups-libs \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    nss \
    wget \
    unzip \
    xdg-utils \
    liberation-fonts \
    alsa-lib \
    cairo \
    pango \
    gtk3 \
    libgbm \
    vulkan \
    xorg-x11-fonts-Type1 \
    glibc \
    && dnf clean all

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm && \
    rpm -ivh google-chrome-stable_current_x86_64.rpm && \
    dnf install -y google-chrome-stable && \
    rm -f google-chrome-stable_current_x86_64.rpm



# Install Chromedriver (latest version)
RUN CHROME_VERSION=$(google-chrome --version | awk '{print $3}') && \
    wget -O /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip" && \
    unzip /tmp/chromedriver.zip -d /usr/bin/ && \
    chmod +x /usr/bin/chromedriver-linux64/chromedriver && \
    rm /tmp/chromedriver.zip && \
    ln -s /usr/bin/chromedriver-linux64/chromedriver /usr/bin/chromedriver

# Set environment variables for Chrome and Chromedriver
ENV CHROME_BIN=/usr/bin/google-chrome
ENV CHROMEDRIVER_BIN=/usr/bin/chromedriver

# Set working directory for your Lambda function
WORKDIR /var/task

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=prod

# Copy your compiled TypeScript code
COPY dist .

# Lambda handler
CMD [ "lambdas/webdriver-state-experiment/index.handler" ]