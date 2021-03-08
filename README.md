# OCC Project DCU

A simple CLI to help with your daily OCC development.


# Installation
```sh
npm install -g occ-project-dcu
```

# Getting Started

First go to the DesignCodeUtility folder and run npm i

```sh
$ npm i
```
Then go back to the root folder and run the commands below

```sh
$ occ --start
? Select an environment: TEST
? Your Admin URL: <URL>
? Your AppKey: <KEY>
Your project is ready!
```

After this you can use everything on this CLI. 

**Note:** You only need to do this once, after that if you need to update, change or configure an environment, please use the Environment Manager (`occ --env <operation>`).

# Options

The following table describes the options you can use with `occ`.

|Option|Description|
|:---|:---|
| `-h, --help` | Provides usage information for the CLI |
| `-V, --version` | Provides the CLI's version |
| `-s, --start` | Starts the project setup |
| `-d, --dev` | Starts Watcher + Browsersync. <br><br> **Note:** [Click here](https://github.com/eduardokeneeth/oracle-commerce-project-example#browsersync) to see how configure Browsersync. |
| `-c, --create <type>` | Creates widget or element. <br><br> **Options:** `widget`, `element`. |
| `-r, --refresh <path>` | Refreshes content from the Commerce instance within the specified directory. |
| `-p, --putAll <path>` | Sends everything from the specified directory. |
| `-e, --env <operation>` | Starts the Environment Manager. <br><br> **Options:** `current`, `config`, `change`. |
| `-t, --put <path/file>` | upload the entire path. |
| `-s, --transfer <path>` | Transfers things between current and selected environment. |
| `-g, --grab <path>` | Starts grabbing everything from current environment. |
