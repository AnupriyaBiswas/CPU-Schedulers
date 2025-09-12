CXX = g++
CXXFLAGS = -std=c++11 -Wall
TARGET = nvidia-project
SOURCES = main.cpp

all: $(TARGET)

$(TARGET): $(SOURCES) parser.h
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SOURCES)

clean:
	rm -f $(TARGET) *.o

.PHONY: all clean
