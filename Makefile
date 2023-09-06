.PHONY: install build preview deploy run clean

install: 
	ln -s ./scripts/pre-push .git/hooks/pre-push

run:
	npm run dev

build:
	npm run build

preview: build
	npm run preview

deploy:
	./scripts/pre-push

clean:
	rm -f .git/hooks/pre-push
	rm -rf deploy/
	rm -rf build/
