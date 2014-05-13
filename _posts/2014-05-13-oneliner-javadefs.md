---
layout: post
title: "Oneliner: javadefs"
tagline: "Show all JVM system properties"
description: "What are the values of file.encoding and os.name?"
tags: [jvm]
image:
  feature: oneliner.jpg
---

{% highlight bash %}
alias javadefs='java -XshowSettings:properties 2>&1'
{% endhighlight %}

Java actually outputs this all to stderr so therefore `2>&1` to redirect it all to stdout to enable paging:

{% highlight bash %}
$ javadefs
Property settings:
    awt.toolkit = sun.lwawt.macosx.LWCToolkit
    file.encoding = UTF-8
    file.encoding.pkg = sun.io
    file.separator = /
...
{% endhighlight %}
