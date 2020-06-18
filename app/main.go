package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
)

var requestCount = 0

func main() {
	httpPort := os.Getenv("PORT")
	if httpPort == "" {
		httpPort = "8000"
		log.Printf("Defaulting to port %s", httpPort)
	}
	http.HandleFunc("/time", timeHandler)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)
	log.Printf("Starting server on port %s\n", httpPort)
	err := http.ListenAndServe(":"+httpPort, logRequest(http.DefaultServeMux))
	if err != nil {
		log.Fatal(err)
	}
}

type request struct {
	Delay      int    `json:"delay"`
	ForceError string `json:"forceError"`
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var reqb request
	err := decoder.Decode(&reqb)
	if err != nil {
		logit(requestCount, r.RemoteAddr, r.Method, r.URL, err.Error())
		if err == io.EOF {
			reqb = request{Delay: 0, ForceError: "none"}
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	logit(requestCount, r.RemoteAddr, r.Method, r.URL, fmt.Sprintf("%v", reqb))
	time.Sleep(time.Duration(reqb.Delay) * time.Second)

	w.Header().Set("Content-Type", "application/json")
	resb := newResponse()
	if reqb.ForceError == "badRequest" {
		resb.Message = "Bad Request"
		w.WriteHeader(http.StatusInternalServerError)
	} else if reqb.ForceError == "internalServer" {
		resb.Message = "Internal Server Error"
		w.WriteHeader(http.StatusInternalServerError)
	} else if reqb.ForceError == "unauthorized" {
		resb.Message = "Unauthorized"
		w.WriteHeader(http.StatusUnauthorized)
	}
	j, err := json.Marshal(resb)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(j)
}

func logRequest(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestCount++
		logit(requestCount, r.RemoteAddr, r.Method, r.URL, "request received")
		handler.ServeHTTP(w, r)
	})
}

func logit(requestCount int, remoteAddr string, method string, url *url.URL, message string) {
	log.Printf("%d %s %s %s %s\n", requestCount, remoteAddr, method, url, message)
}

func getTime() string {
	t := time.Now().Format("15:04:05")
	return t
}

type response struct {
	Time    string `json:"time"`
	Message string `json:"message"`
}

func newResponse() response {
	t := getTime()
	r := response{Time: t, Message: "success"}
	return r
}
