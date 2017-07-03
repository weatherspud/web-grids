.PHONY: build
build: clean_static node_modules static/js/hex_grid.bundle.js

node_modules:
	npm install

static/js/hex_grid.bundle.js:
	./node_modules/.bin/webpack

.PHONY: eslint
eslint:
	find src/js -name '*.js' | xargs ./node_modules/.bin/eslint

.PHONY: check
check: eslint

.PHONY: clean_static
clean_static:
	rm -rf static

.PHONY: clean
clean: clean_static
	rm -rf node_modules
