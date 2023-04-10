TMPDIR=/tmp
TMPFILE=$(TMPDIR)/bindertron.tmp
SERVICE=bindertron.service

install:
	rm -f $(TMPFILE)
	pwd > $(TMPFILE)
	echo `cat $(TMPFILE)`
	sed "s|\$${WORKDIR}|`cat $(TMPFILE)`|" $(SERVICE) > $(TMPFILE)
	mv $(TMPFILE) /etc/systemd/system/$(SERVICE)
	systemctl enable $(SERVICE)
	systemctl restart $(SERVICE)

uninstall:
	systemctl stop $(SERVICE)
	systemctl disable $(SERVICE)
	rm /etc/systemd/system/$(SERVICE)
	

