<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Home Page</title>
        <link href="/favicon.ico" rel="shortcut icon" type="image/x-icon" />
        <meta name="viewport" content="width=device-width" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="js/helpers.js"></script>
        <script src="js/main.js"></script>
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,400,300,600' rel='stylesheet' type='text/css'>
        <link href='css/base.css' rel='stylesheet' type='text/css'>
        <link href='css/icon.css' rel='stylesheet' type='text/css'>
    </head>
    <body>
        
        <div id="pageWrapper">
            <div class="inner-wrap" id="pageContent">
                <div id="headings">
                    <h1>Welcome</h1>
                    <h2>You seem to be near <span id="stationOutput" class="cap"></span></h2>
                    <h3 class="toggleBtn"><span id="changeText">Change Station</span><span id="hideText" class="hidden">Hide Station List</span></h3>
                    <div id="stationSelect" class="hidden station-select-wrap">
                        <select id="stationSelector" class="cap">
                            <option>---</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    <script type="text/javascript">
        $(document).ready(function () {
            MartaTimes.init();
        });
    </script>
    </body>
</html>